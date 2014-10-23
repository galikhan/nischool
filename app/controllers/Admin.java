package controllers;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.List;

import models.Category;
import models.Language;
import models.Resource;
import play.data.validation.Required;
import play.db.jpa.Blob;
import play.libs.Files;
import play.libs.MimeTypes;
import play.mvc.Controller;


public class Admin extends Controller {
	
    public static void admin(){
    	List<Category> categories = Category.findAll();
    	render(categories);
    }
    
    public static void listCategories(){
    	List<Category> categories = Category.findAll();
    	render(categories);
    }
    
    public static void listResources(){
    	List<Resource> resources = Resource.findAll();
    	render(resources);
    }
    
    public static void listLanguages(){
    	List<Language> languages = Language.findAll();
    	render(languages);
    }
    
    public static void addCategory(@Required(message="Name is required") String name, Long parentId){
    	
        if(validation.hasErrors()) {
        	List<Category> categories = Category.findAll();
            render("Admin/addCategory.html", categories);
        }
    	new Category(name, parentId).save();
    	listCategories();
    }
    
    public static void addResource(@Required(message="title is required") String title,
    		@Required(message="Keyword is required") String keywords,
    		@Required(message="Author is required") String author,
    		@Required(message="Description is required") String description,
    		@Required(message="ContentType is required") String contentType,
    		@Required(message="Category is required") Long categoryId,
    		@Required(message="Language is required") Long languageId,
    		File poster, File cor
    		){
    	
        if(validation.hasErrors()) {
        	List<Category> categories = Category.findAll();
        	List<Language> languages = Language.findAll();
            render("Admin/addResource.html", categories, languages);
        }
        
    	Resource resource = new Resource(title, keywords, author, description, contentType, categoryId, languageId);
		resource.resourceSize = cor.length();
		resource.save();
		
		resource.posterName = poster.getName();
		resource.save();
		File dir = new File("public/media-content/" + resource.id);
		dir.mkdirs();
		poster.renameTo(new File("public/media-content/" + resource.id + "/" + resource.posterName));
		System.out.println("added" + poster.getName());

		if(resource.contentType.equals("SCORM")){
			resource.corName = cor.getName().substring(0, cor.getName().length()-4);
			File unzippedCOR = new File("public/media-content/" + resource.id + "/"  + resource.corName);
			Files.unzip(cor, unzippedCOR);
			resource.save();
		}else{
			System.out.println(resource.contentType);
			resource.corName = cor.getName();
			cor.renameTo(new File("public/media-content/" + resource.id + "/" + resource.corName));
			resource.save();
		}
		listResources();
    }
    
    public static void addLanguage(@Required(message="Id is required") Long languageId,
    		@Required(message="Name is required") String languageName){
    	
        if(validation.hasErrors()) {
            render("Admin/addLanguage.html");
        }

    	System.out.println(languageId + languageName);
    	Language lang = Language.findById(languageId);
    	if(lang == null){
    		new Language(languageId, languageName).save();
    	}
    	listLanguages();
    }
    
    public static void editCategory(Long id){
    	render();
    }
    
    public static void editResource(Long id){
    	render();
    }
    
    public static void editLanguage(@Required(message="Id is required") Long languageId, @Required(message="Name is required") String languageName){
    	System.out.println(languageId + languageName);
    	Language language = Language.findById(languageId);
    	if(languageName == null){
    		render();
    	}
    	else{
	    	language.id = languageId;
	    	language.languageName = languageName;
	    	language._save();
	    	listLanguages();
    	}
    }
    
    public static void deleteCategory(Long id){
    	Category category = Category.findById(id);
    	category._delete();
    	listCategories();
    }
    
    public static void deleteResource(long id) {
 	   final Resource resource = Resource.findById(id);
 	   resource.delete();
 	   listResources();
    }
    
    public static void deleteLanguage(Long id){
    	Language language = Language.findById(id);

    	language._delete();
    	listLanguages();
    }
    

}
