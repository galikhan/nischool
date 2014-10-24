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
    	List<Resource> resources = Resource.findAll();
    	render(resources);
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
		admin();
    }
    
    public static void deleteResource(long id) {
 	   final Resource resource = Resource.findById(id);
 	   resource.delete();
 	   admin();
    }
    

}
