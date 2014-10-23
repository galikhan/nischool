package models;
 
import java.util.*;
import javax.persistence.*;
 
import play.data.validation.MaxSize;
import play.db.jpa.*;
 
@Entity
@Table(name="NS_COMMENT")
public class Comment extends Model {
 
    public String author;
    public Date postedAt;
     
	@MaxSize(10000)
    public String content;
    
    @ManyToOne
    public Resource resource;
    
    public Comment(Resource resource, String author, String content) {
        this.resource = resource;
        this.author = author;
        this.content = content;
        this.postedAt = new Date();
    }
 
}