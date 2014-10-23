package models;

import java.util.*;

import javax.persistence.*;

import play.db.jpa.Model;
import play.data.validation.*;

@Entity
@Table(name="NS_CATEGORY")
public class Category extends Model {

    @Required
    @Column(name="NAME_")
    public String name;

    @Column(name="PARENT_ID_")
    public Long parentId;

    @OneToMany(mappedBy="categories", cascade=CascadeType.ALL)
    public List<Category> categories;

    @ManyToMany(mappedBy="categories")
    public List<Resource> resources = new ArrayList<Resource>();

    public Category(String name, Long parentId){
        this.name = name;
        this.parentId = parentId;
    }

    public String toString() {
        return id + " - " + name;
    }
}